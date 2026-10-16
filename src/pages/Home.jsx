import React, { useEffect, useState } from "react";

const RAW = "https://raw.githubusercontent.com/Bastiantoloza27/Puerto-Ventanas-Testeo/main/";

export default function Home() {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let url;
    Promise.all([
      fetch(RAW + "prototipo.dc.html").then((r) => r.text()),
      fetch(RAW + "support.js").then((r) => r.text()),
    ]).then(([html, js]) => {
      const jsUrl = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
      const logo = RAW + "assets/pvsa-logo.png";
      const full = html
        .replace('src="./support.js"', `src="${jsUrl}"`)
        .replaceAll('src="assets/pvsa-logo.png"', `src="${logo}"`)
        .replaceAll("src:'assets/pvsa-logo.png'", `src:'${logo}'`)
        .replaceAll("${base}assets/pvsa-logo.png", logo)
        .replaceAll("${location.href.replace(/[^/]*$/,'')}assets/pvsa-logo.png", logo);
      url = URL.createObjectURL(new Blob([full], { type: "text/html" }));
      setSrc(url);
    });
    return () => url && URL.revokeObjectURL(url);
  }, []);

  if (!src) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0E2A2B]">
        <div className="w-8 h-8 border-4 border-[#1F4344] border-t-[#00ABAC] rounded-full animate-spin" />
      </div>
    );
  }

  return <iframe title="Testeos aleatorios PVSA" src={src} className="fixed inset-0 w-full h-full border-0" />;
}