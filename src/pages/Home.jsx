import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RAW = "https://raw.githubusercontent.com/Bastiantoloza27/Puerto-Ventanas-Testeo/main/";

const NAV_SCRIPT = `<script>(function(){function add(){if(document.getElementById('pv-personas'))return;var b=[].slice.call(document.querySelectorAll('button')).find(function(x){return x.textContent.trim()==='Seguimiento'});if(!b)return;var n=b.cloneNode(true);n.id='pv-personas';n.textContent='Personas';n.onclick=function(){parent.postMessage({pv:'personas'},'*')};b.after(n)}new MutationObserver(add).observe(document.documentElement,{childList:true,subtree:true});})()</script>`;

export default function Home() {
  const [src, setSrc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onMsg = (e) => e.data?.pv === "personas" && navigate("/personas");
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [navigate]);

  useEffect(() => {
    let url;
    Promise.all([
      fetch(RAW + "prototipo.dc.html").then((r) => r.text()),
      fetch(RAW + "support.js").then((r) => r.text()),
    ]).then(([html, js]) => {
      const jsUrl = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
      const logo = RAW + "assets/pvsa-logo.png";
      const full = html
        .replace('<div style="padding:9px 10px;font-size:14px;color:#a9c1c0">Personas</div>', "")
        .replace("</body>", NAV_SCRIPT + "</body>")
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