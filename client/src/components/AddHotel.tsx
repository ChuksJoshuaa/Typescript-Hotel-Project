import React, { useState } from "react";
import { FaBlogger } from "react-icons/fa";
import { CREATE_HOTEL } from "../mutations/createHotel";
import { GET_HOTELS } from "../queries/hotels";
import { GET_HOTEL_BRANDS } from "../queries/brands";
import { useMutation, useQuery } from "@apollo/client";

const AddHotel = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [brandName, setBrandName] = useState("");

  const [createHotel] = useMutation(CREATE_HOTEL);
  const { data } = useQuery(GET_HOTEL_BRANDS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      name === "" ||
      description === "" ||
      image === "" ||
      price === "" ||
      city === "" ||
      address === "" ||
      country === "" ||
      brandName === ""
    ) {
      return alert("Please fill in the field");
    }

    let myPrice = parseInt(price);

    createHotel({
      variables: {
        input: {
          name: name,
          description: description,
          image: image,
          price: myPrice,
          address: address,
          city: city,
          country: country,
          brandName: brandName,
        },
      },
      refetchQueries: [{ query: GET_HOTELS }],
    });

    setName("");
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        data-bs-toggle="modal"
        data-bs-target="#addHotel"
      >
        <div className="d-flex align-items-center">
          <FaBlogger className="icon" />
          <div>Add Hotel</div>
        </div>
      </button>

      <div
        className="modal fade"
        id="addHotel"
        tabIndex={1}
        aria-labelledby="addHotelModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="addHotelModal">
                Add Hotel
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Hotel Name</label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    id="description"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image Url</label>
                  <input
                    type="text"
                    id="image"
                    className="form-control"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="text"
                    id="price"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    id="address"
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    id="city"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    id="country"
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Choose Brand</label>
                  <select
                    className="form-select"
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  >
                    {data?.brands.length > 0
                      ? data?.brands.map((item: any) => (
                          <option value={item.name}>{item.name}</option>
                        ))
                      : null}
                  </select>
                </div>

                <button
                  className="btn btn-secondary"
                  type="submit"
                  data-bs-dismiss="modal"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddHotel;
