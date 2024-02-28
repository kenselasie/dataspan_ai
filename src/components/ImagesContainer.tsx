"use client";
import * as React from "react";
import { BoneFractureType } from "@/app/page";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

type ImagesContainerType = {
  data: BoneFractureType[];
};
const ImagesContainer = ({ data }: ImagesContainerType) => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "";
  const [openDialog, setOpendialog] = React.useState(false);
  const [modalData, setModalData] = React.useState<BoneFractureType>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 50;

  const showImageModal = (data: BoneFractureType) => {
    setOpendialog(true);
    setModalData(data);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change the current page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  React.useEffect(() => {
    paginate(1);
  }, [mode]);

  return (
    <div className="flex flex-col mb-10">
      <Dialog open={openDialog} onOpenChange={() => setOpendialog(false)}>
        <div className="grid grid-cols-10 items-center gap-4 w-max">
          {currentItems?.map((el, i) => (
            <div key={i}>
              <Image
                src={el.thumbnail}
                alt={el.labels}
                className="w-[100px] h-[100px]"
                width={100}
                height={100}
                onClick={() => showImageModal(el)}
              />
            </div>
          ))}
        </div>
        <DialogContent className="sm:px-16 sm:max-w-[600px]">
          {modalData && (
            <div>
              <div className="sm:max-w-[400px]">
                {/* <p className="text-wrap break-normal">{decodeURIComponent(modalData.image.replace(href, ''))}</p> */}
                <p className="text-wrap break-normal">{modalData.labels}</p>
              </div>
              <div className="flex flex-col items-center m-5">
                <Image
                  src={modalData.image}
                  alt={modalData.image}
                  className="w-[500px] h-[500px]"
                  width={100}
                  height={100}
                />
                <canvas
                  id="overlayCanvas"
                  className="absolute top-0 left-0 w-[500px] h-[500px]"
                ></canvas>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div>
        <div className="flex justify-center mt-16">
          <div className="bg-gray-200 rounded-3xl">
            {Array.from({ length: Math.ceil(data.length / itemsPerPage) }).map(
              (_, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 mr-2 rounded-full ${
                    currentPage === index + 1
                      ? "bg-[#FFD75C] text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesContainer;
