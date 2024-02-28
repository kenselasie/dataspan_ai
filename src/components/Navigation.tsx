import React from "react";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { Dot, Trash2 } from "lucide-react";
import progressImg from "@/assets/progress.svg";
const Navigation = ({ data }: { data: string[] }) => {
  return (
    <aside className="w-[332px] border rounded-lg m-7">
      <div className="h-[75px] w-[95%] flex justify-center items-center m-2">
        <Image src={logo} alt="org_logo" />
      </div>
      <div className="mt-9 mx-8">
        <section>
          <p className="font-semibold mt-8">Classes filter</p>
          <div className="flex space-x-3 mt-4">
            <p className="text-sm text-gray-300">Select all</p>
            <p className="text-sm text-blue-500">Deselect all</p>
          </div>
          <div className="flex flex-wrap gap-x-2 mt-4">
            {data.map((data, i) => (
              <div className="" key={i}>
                <div className="flex items-center border-2 border-[#3D9BE9] w-max py-1 pr-2 rounded-3xl my-2 bg-[#b9d8f2]">
                  <Dot color="#3D9BE9" spacing={0} strokeWidth={8} />{" "}
                  <p className="text-sm font-semibold capitalize-first-letter">
                    {data}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <p className="font-semibold mt-8">Poligon range</p>
          <div className="flex justify-between mt-2">
            <p className="text-sm">
              min <span className="font-semibold">0</span>
            </p>
            <p className="text-sm">
              max <span className="font-semibold">4</span>
            </p>
          </div>
          <div className="mt-3">
            <Image src={progressImg} alt="progress"/>
          </div>
          <div className="flex items-center justify-between text-sm mt-6">
            <div className="flex items-center gap-1 font-semibold">
              <Trash2 /> <p>Clear Filters</p>
            </div>
            <p className="text-gray-400">Need help?</p>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default Navigation;
