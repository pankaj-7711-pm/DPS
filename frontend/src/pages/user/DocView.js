import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const DocView = () => {
  const params = useParams();
  //   const { did } = useParams();
  const [doc, setDoc] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        console.log(params.did);
        const res = await axios.post(
          "http://localhost:4000/api/v1/userctrl/get-single-doc",
          {
            docid: String(params.did), 
          }
        );
        setDoc(res.data.document);
      } catch (error) {
        toast({
          title: "error in fetching the document",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    };

    fetchDoc();
  }, [params.did]);

  useEffect(() => {
    console.log(doc);
  }, [doc]);

  return (
    <div className="container-fluid px-0">
      <div
        className="row g-0 d-flex flex-column flex-md-row"
        style={{ height: "100vh" }}
      >
        {/* Left Side: PDF Display */}
        <div
          className="col-md-6 bg-light overflow-auto"
          style={{ height: "100vh" }}
        >
          {doc ? (
            <iframe
              src={doc.file_path}
              title={doc.file_name}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            ></iframe>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p>Loading document...</p>
            </div>
          )}
        </div>

        {/* Vertical Line (desktop only) */}
        <div
          className="d-none d-md-block"
          style={{ width: "2px", backgroundColor: "#000" }}
        ></div>

        {/* Right Side: Black Div */}
        <div className="col-md-6 bg-dark" ></div>
      </div>
    </div>
  );
};

export default DocView;
