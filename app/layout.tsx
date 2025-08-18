import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Search Platform",
  description: "AI Search Platform Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="header-container">
            <div className="logo-left">
              {/*<Image*/}
              {/*    src="https://polyukteo.10u.org/kteo/polyu-ip-portal/themes/polyurio/static/static/images/logo.png"*/}
              {/*    alt="KTEO Logo"*/}
              {/*    width={400}*/}
              {/*    height={110}*/}
              {/*    priority*/}
              {/*    unoptimized={true}*/}
              {/*/>*/}
              <h1 className="text-3xl font-bold text-white">AI Search Platform</h1>
            </div>
            <div className="logo-right">
              <Image 
                src="https://www.polyu.edu.hk/assets/img/fact-logo-2x.png"
                alt="PolyU Logo"
                width={400}
                height={110}
                priority
                unoptimized={true}
              />
            </div>
          </header>
          {/*<div className="bg-[#a02337] py-12">*/}
          {/*  <div className="max-w-7xl mx-auto px-8">*/}
          {/*    <h1 className="text-3xl font-bold text-white">Knowledge Search</h1>*/}
          {/*  </div>*/}
          {/*</div>*/}
          {children}
        </Providers>
      </body>
    </html>
  );
}
