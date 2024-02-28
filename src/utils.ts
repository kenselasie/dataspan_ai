import { BoneFractureType } from "./components/Homepage";

export const mergeArrays = async (
  imagesData: string[],
  labelsData: string[],
  thumbnailData: string[]
) => {
  const result: BoneFractureType[] = [];

  const maxLength = Math.max(
    imagesData.length,
    labelsData.length,
    thumbnailData.length
  );

  for (let i = 0; i < maxLength; i++) {
    const image = imagesData[i] || "";

    const labels = await readTextFile(labelsData[i]);
    const thumbnail = thumbnailData[i] || "";

    result.push({ image, labels, thumbnail });
  }

  return result;
};

export const readTextFile = async (url: string) => {
  const content: string = await new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          reject("Network response was not OK");
        }
        return response.text();
      })
      .then((text) => {
        resolve(text);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  return content;
};
