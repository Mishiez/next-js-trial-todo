"use client"

import {usePathname} from "next/navigation";
import React from 'react';

const Page = () => {
  const pathname = usePathname()

  const projectId = pathname.split("/")[1]

  console.log(pathname)
  console.log(projectId)

  return (
    <div>
      {projectId}
    </div>
  );
};

export default Page;