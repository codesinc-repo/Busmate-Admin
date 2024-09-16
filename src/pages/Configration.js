import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteACoupon, getAllCoupon } from "../features/coupon/couponSlice";
import CustomModal from "../components/CustomModal";
import { Container } from "react-bootstrap";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },

  {
    title: "Name",
    dataIndex: "name",
    sorter: (a, b) => a.name.length - b.name.length,
  },
  {
    title: "Discount",
    dataIndex: "discount",
    sorter: (a, b) => a.discount - b.discount,
  },
  {
    title: "Expiry",
    dataIndex: "expiry",
    sorter: (a, b) => a.name.length - b.name.length,
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Configration = () => {
  const [open, setOpen] = useState(false);
  const [couponId, setcouponId] = useState("");
  const showModal = (e) => {
    setOpen(true);
    setcouponId(e);
  };

  const hideModal = () => {
    setOpen(false);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllCoupon());
  }, []);
  const couponState = useSelector((state) => state.coupon.coupons);
  const data1 = [];
  for (let i = 0; i < couponState.length; i++) {
    data1.push({
      key: i + 1,
      name: couponState[i].name,
      discount: couponState[i].discount,
      expiry: new Date(couponState[i].expiry).toLocaleString(),
      action: (
        <>
          <Link
            to={`/admin/coupon/${couponState[i]._id}`}
            className=" fs-3 text-danger"
          >
            <BiEdit />
          </Link>
          <button
            className="ms-3 fs-3 text-danger bg-transparent border-0"
            onClick={() => showModal(couponState[i]._id)}
          >
            <AiFillDelete />
          </button>
        </>
      ),
    });
  }
  const deleteCoupon = (e) => {
    dispatch(deleteACoupon(e));

    setOpen(false);
    setTimeout(() => {
      dispatch(getAllCoupon());
    }, 100);
  };
  return (
    <Container className="container-fluid px-3 pt-4">
      <div>
        <div className="text-center  ">
          <h2 className="text-uppercase p-2 page-title">Configration</h2>
        </div>
        <div>
          <div>
            {/* <Table columns={columns} dataSource={data1} /> */}
          </div>
          <CustomModal
            hideModal={hideModal}
            open={open}
            performAction={() => {
              deleteCoupon(couponId);
            }}
            title="Are you sure you want to delete this Coupon?"
          />
        </div>
      </div>
    </Container>
  );
};

export default Configration;
