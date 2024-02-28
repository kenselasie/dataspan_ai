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
  const href =
    "https://s3.eu-central-1.amazonaws.com/dataspan.frontend-home-assignment/bone-fracture-detection";
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "";
  const [openDialog, setOpendialog] = React.useState(false);
  const [modalData, setModalData] = React.useState<BoneFractureType>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 50;

  const classAttr = {
    classId: {
      color: "red",
    },
  };
  const showImageModal = (data: BoneFractureType) => {
    setOpendialog(true);
    setModalData(data);
    // drawPolygon();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change the current page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  function scaleCoordinates(
    coordinates: string,
    imageWidth: number,
    imageHeight: number
  ): string {
    const coordinatePairs = coordinates.split(" ");

    const scaledCoordinates = coordinatePairs.map((pair) => {
      const [x, y] = pair.split(",");

      const scaledX = parseFloat(x) * imageWidth;
      const scaledY = parseFloat(y) * imageHeight;

      return `${scaledX},${scaledY}`;
    });

    return scaledCoordinates.join(" ");
  }

  React.useEffect(() => {
    paginate(1);
  }, [mode]);

  return (
    <React.Suspense>
      <div className="flex flex-col mb-10">
        <Dialog open={openDialog} onOpenChange={() => setOpendialog(false)}>
          <div className="grid grid-cols-10 items-center gap-4 w-max">
            {currentItems?.map((el, i) => (
              <div
                className="relative w-full"
                onClick={() => showImageModal(el)}
                key={i}
              >
                <Image
                  src={el.thumbnail}
                  alt={el.labels}
                  className="w-[100px] h-[100px]"
                  width={100}
                  height={100}
                />
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1 1"
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <polygon
                    width={10}
                    points={scaleCoordinates(el.labels, 100, 100)}
                    fill={classAttr.classId?.color}
                    stroke="red"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            ))}
          </div>
          <DialogContent className="sm:px-16 sm:max-w-[600px]">
            {modalData && (
              <div>
                <div className="sm:max-w-[400px]">
                  <p className="text-wrap break-normal">
                    {modalData.labels.substring(2)}
                  </p>
                </div>
                <p className="text-wrap break-normal truncate">
                  {decodeURIComponent(modalData.image)
                    .replace(href, "")
                    .replace("/valid/images/", "")
                    .replace("/test/images/", "")
                    .replace("/train/images/", "")}
                </p>
                <div className="relative w-full flex flex-col items-center m-5">
                  <div className="self-start">
                    <p>Details:</p>
                    <button className="px-5 mb-4  rounded-3xl bg-yellow-400">
                      fracture_1
                    </button>
                  </div>
                  <Image
                    src={modalData.image}
                    alt={modalData.image}
                    className="w-[500px] h-[500px]"
                    width={100}
                    height={100}
                  />
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1 1"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <polygon
                      points={scaleCoordinates(
                        modalData.labels.substring(2),
                        500,
                        500
                      )}
                      fill={classAttr.classId?.color}
                      stroke="red"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <div>
          <div className="flex justify-center mt-16 text-sm">
            <div className="bg-gray-200 rounded-3xl">
              {Array.from({
                length: Math.ceil(data.length / itemsPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 mr-1 rounded-full ${
                    currentPage === index + 1
                      ? "bg-[#FFD75C] text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Suspense>
  );
};

export default ImagesContainer;
