"use client";
import * as React from "react";
import AWS from "aws-sdk";
import Image from "next/image";
import { mergeArrays, readTextFile } from "@/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import yaml from 'js-yaml';

import Navigation from "@/components/Navigation";
export type BoneFractureType = {
  image: string;
  labels: string;
  thumbnail: string;
};
export default function Home() {
  const albumBucketName = "dataspan.frontend-home-assignment";

  AWS.config.region = "eu-central-1"; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "eu-central-1:31ebe2ab-fc9d-4a2c-96a9-9dee9a9db8b9",
  });
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: albumBucketName },
  });
  const href = `https://${s3.config.endpoint}/${albumBucketName}/bone-fracture-detection`;
  const [isLoading, setIsLoading] = React.useState(false);
  const [openDialog, setOpendialog] = React.useState(false);
  const [modalData, setModalData] = React.useState<BoneFractureType>();
  const [albums, setAlbums] = React.useState<string[]>([]);
  const [trainData, setTrainData] = React.useState<BoneFractureType[]>([]);
  const [validData, setValidData] = React.useState<BoneFractureType[]>([]);
  const [testData, setTestData] = React.useState<BoneFractureType[]>([]);
  const [mode, setMode] = React.useState<"all" | "train" | "valid" | "test">(
    "all"
  );
  const [dataToDisplay, setDataToDisplay] = React.useState<BoneFractureType[]>(
    []
  );
  const [dataClassNames, setDataClassName] = React.useState<string[]>([]);

  const getCategoriesData = async (
    encodedAlbumName: string,
    folderName: "images" | "thumbnails" | "labels" | "data.yaml"
  ) => {
    const albumPhotosKey =
      encodedAlbumName + "/" + encodeURIComponent(folderName);
    const items: string[] = await new Promise((resolve, _) => {
      s3.listObjects(
        { Bucket: albumBucketName, Prefix: albumPhotosKey, MaxKeys: 50 },
        function (this: any, err, data) {
          if (err) {
            return console.log(err);
          }
          // 'this' references the AWS.Request instance that represents the response
          const href = this?.request?.httpRequest?.endpoint?.href;
          const bucketUrl = href + albumBucketName + "/";

          const photos = data?.Contents?.map((photo) => {
            const photoKey = photo.Key!;
            const photoUrl = bucketUrl + encodeURIComponent(photoKey);
            return photoUrl;
          });
          resolve(photos || []);
        }
      );
    });
    return items;
  };

  const getFolderData = async (
    albumName: string,
    folderName: "test" | "train" | "valid"
  ) => {
    const classes = await getCategoriesData(
      encodeURIComponent(albumName),
      "data.yaml"
    );
    const classesYamlText = await readTextFile(classes[0])
    const yamlData: any = yaml.load(classesYamlText);

    setDataClassName(yamlData?.names)
    const name =
      encodeURIComponent(albumName) + "/" + encodeURIComponent(folderName);
    const imagesData = await getCategoriesData(name, "images");
    const thumbnailData = await getCategoriesData(name, "thumbnails");
    const labelsData = await getCategoriesData(name, "labels");
    const organizedData = await mergeArrays(
      imagesData,
      labelsData,
      thumbnailData
    );
    return organizedData;
  };

  React.useEffect(() => {
    if (mode === "all") {
      setDataToDisplay([...trainData, ...validData, ...testData]);
    } else if (mode == "train") {
      setDataToDisplay(trainData);
    } else if (mode == "test") {
      setDataToDisplay(testData);
    } else if (mode == "valid") {
      setDataToDisplay(validData);
    }
  }, [mode, testData, trainData, validData]);

  React.useEffect(() => {
    // List the photo albums that exist in the bucket.
    const listAlbums = async () => {
      const albums: string[] = await new Promise((resolve, reject) => {
        s3.listObjects(
          { Bucket: albumBucketName, Delimiter: "/" },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              const albums = data?.CommonPrefixes?.map((commonPrefix: any) => {
                const prefix = commonPrefix.Prefix!;
                const albumName = decodeURIComponent(prefix.replace("/", ""));
                return albumName;
              });
              resolve(albums || []);
            }
          }
        );
      });
      return albums;
    };

    const getAllData = async () => {
      setIsLoading(true);
      const albums = await listAlbums();
      setAlbums(albums);
      const trainData = await getFolderData(albums[0], "train");
      const testData = await getFolderData(albums[0], "test");
      const validData = await getFolderData(albums[0], "valid");

      setTrainData(trainData);
      setTestData(testData);
      setValidData(validData);
      setIsLoading(false);
    };

    getAllData();
  }, []);

  const drawPolygon = (data: BoneFractureType) => {
    const canvas = document.getElementById(
      "overlayCanvas"
    ) as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    console.log('something')
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    const coordinates = [
      [0.2812864961679916, 0.18593750149011612],
      [0.43129762479210765, 0.18604196943181694],
      [0.4500078614345723, 0.26731557455032673],
      [0.2792760821978364, 0.26262672532890263],
    ];

    ctx.beginPath();
    ctx.moveTo(
      coordinates[0][0] * canvas.width,
      coordinates[0][1] * canvas.height
    );
    for (let i = 1; i < coordinates.length; i++) {
      ctx.lineTo(
        coordinates[i][0] * canvas.width,
        coordinates[i][1] * canvas.height
      );
    }
    ctx.closePath();
    ctx.stroke();
  };

  const showImageModal = (data: BoneFractureType) => {
    setOpendialog(true);
    setModalData(data);
    drawPolygon(data)
  };

  return (
    <div className="flex h-screen w-screen">
      <Navigation data={dataClassNames} />
      <main className="flex-1 h-[100vh] my-10">
        <Dialog open={openDialog} onOpenChange={() => setOpendialog(false)}>
          {!isLoading ? (
            <div className="mx-3">
              <div className="flex items-center justify-between mb-14">
                <h2 className="capitalize-first-letter font-semibold text-2xl">
                  {albums[0]}
                </h2>
                <p className="text-base">
                  <span className="font-semibold">54</span> of{" "}
                  <span className="font-semibold">{dataToDisplay.length}</span>{" "}
                  images
                </p>
              </div>
              <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
                <ul className="flex flex-wrap mb-4 border-b-2">
                  <li className="me-2">
                    <Link
                      href="#"
                      onClick={() => setMode("all")}
                      className={cn({
                        "inline-block px-5 py-1": true,
                        "text-[#FFD75C] border-b-2 border-[#FFD75C] bg-[#fbf0d6]":
                          mode == "all",
                      })}
                      ara-current="page"
                    >
                      All groups
                    </Link>
                  </li>
                  <li className="me-2">
                    <Link
                      href="#"
                      onClick={() => setMode("train")}
                      className={cn({
                        "inline-block px-5 py-1": true,
                        "text-[#FFD75C] border-b-2 border-[#FFD75C] bg-[#fbf0d6]":
                          mode == "train",
                      })}
                      ara-current="page"
                    >
                      Train
                    </Link>
                  </li>
                  <li className="me-2">
                    <Link
                      href="#"
                      onClick={() => setMode("valid")}
                      className={cn({
                        "inline-block px-5 py-1": true,
                        "text-[#FFD75C] border-b-2 border-[#FFD75C] bg-[#fbf0d6]":
                          mode == "valid",
                      })}
                      ara-current="page"
                    >
                      Valid
                    </Link>
                  </li>
                  <li className="me-2">
                    <Link
                      href="#"
                      onClick={() => setMode("test")}
                      className={cn({
                        "inline-block px-5 py-1": true,
                        "text-[#FFD75C] border-b-2 border-[#FFD75C] bg-[#fbf0d6]":
                          mode == "test",
                      })}
                      ara-current="page"
                    >
                      <p className="text-small">Test</p>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex">
                <div className="grid grid-cols-10 items-center gap-4 w-max">
                  {dataToDisplay?.map((data, i) => (
                    <div key={i}>
                      <Image
                        src={data.thumbnail}
                        alt={data.labels}
                        className="w-[100px] h-[100px]"
                        width={100}
                        height={100}
                        onClick={() => showImageModal(data)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">Loading....</div>
          )}

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
      </main>
    </div>
  );
}
