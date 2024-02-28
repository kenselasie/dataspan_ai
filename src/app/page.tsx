"use client";
import * as React from "react";
import AWS from "aws-sdk";
import Image from "next/image";
import { mergeArrays, readTextFile } from "@/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import yaml from "js-yaml";

import Navigation from "@/components/Navigation";
import ImagesContainer from "@/components/ImagesContainer";
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
        { Bucket: albumBucketName, Prefix: albumPhotosKey, MaxKeys: 200 },
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
    const classesYamlText = await readTextFile(classes[0]);
    const yamlData: any = yaml.load(classesYamlText);

    setDataClassName(yamlData?.names);
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
    setDataToDisplay([...trainData, ...validData, ...testData]);
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

  return (
    <div className="flex h-screen w-screen">
      <Navigation data={dataClassNames} />
      <main className="flex-1 h-[90vh] my-10">
        {!isLoading ? (
          <div className="mx-3">
            <div className="flex items-center justify-between mb-14">
              <h2 className="capitalize-first-letter font-semibold text-2xl">
                {albums[0]}
              </h2>
              <p className="text-base">
                <span className="font-semibold">50</span> of{" "}
                <span className="font-semibold">{dataToDisplay.length}</span>{" "}
                images
              </p>
            </div>
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
              <ul className="flex flex-wrap mb-4 border-b-2">
                <li className="me-2">
                  <Link
                    href={`/?mode=${'all'}`}
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
                    href={`/?mode=${'train'}`}
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
                    href={`/?mode=${'valid'}`}
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
                    href={`/?mode=${'test'}`}
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
              <ImagesContainer data={dataToDisplay} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">Loading....</div>
        )}
      </main>
    </div>
  );
}
