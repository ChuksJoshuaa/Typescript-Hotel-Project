import {
  Resolver,
  Field,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
  // FieldResolver,
  // Root,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import "dotenv-safe/config";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constant";
import { validateRegister } from "../../utils/validateRegister";
import { UserPasswordInput } from "../../utils/UserPasswordInput";
import { sendEmail } from "../../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userEmail === user.email) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password length must be greater than 2",
          },
        ],
      };
    }

    const redisKey = `${FORGET_PASSWORD_PREFIX}${token}`;
    const userId = await redis.get(redisKey);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    let myUserId = userId;

    const user = await User.findOne({ where: { email: myUserId as any } });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, newPassword);
    if (valid) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Choose a new password",
          },
        ],
      };
    }

    await User.update(
      { _id: user._id as any },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(redisKey);

    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email: email } });
    if (user === null || user === undefined || !user) {
      return false;
    }

    let token = v4();

    let expireDate = 1000 * 60 * 60 * 24 * 3;

    await redis.set(
      `${FORGET_PASSWORD_PREFIX}${token}`,
      user.email as any,
      "EX",
      `${expireDate}`
    );
    const textMessage = `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">reset password</a>`;
    await sendEmail(email, textMessage);
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userEmail) {
      return null;
    }

    return User.findOne({ where: { email: req.session.userEmail } });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserPasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    let user;

    try {
      const result = await User.create({
        username: options.username,
        password: hashedPassword,
        email: options.email,
      }).save();

      user = result;
    } catch (error) {
      console.log(`error: ${error}`);
      if (error) {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
    }

    if (user) {
      req.session.userId = user._id;
      req.session.userEmail = user.email;
    }

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (
      email.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      ) === null
    ) {
      return {
        errors: [
          {
            field: "email",
            message: "Please provide a valid email",
          },
        ],
      };
    }
    let user = await User.findOne({ where: { email } });

    if (user === null || user === undefined || !user) {
      return {
        errors: [
          {
            field: "email",
            message: "user does not exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
