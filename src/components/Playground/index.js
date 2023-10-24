import React, { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import sdk from "@stackblitz/sdk";
import packageJson from "./js-playground-files/package.json";

export default function Playground({ children, lang }) {
  const isActive =
    new URLSearchParams(window.location.search).get("lang") === lang;
  const [chromaHost, setChromaHost] = useState("localhost");
  const [chromaPort, setChromaPort] = useState("8000");

  useEffect(() => {
    let files = {};
    switch (lang) {
      case "js":
        files = {
          ...files,
          "package.json": JSON.stringify(packageJson),
          "index.js": children.props?.children?.props?.children
            .replace("localhost", chromaHost)
            .replace(":8000", chromaPort === '443' || chromaPort === '80' ? '' : `:${chromaPort}`)
            .replace("port=8000", `port=${chromaPort}`)
            .replace("ssl=False", chromaPort === '443' ? "ssl=True" : "ssl=False")
            .replace("http", chromaPort === '443' ? "https" : "http"),
        };
        break;
      case "py":
        files = {
          ...files,
          "main.py": children.props?.children?.props?.children,
        };
        break;
      default:
        throw new Error(
          `Wrong usage of Playground component. You need to pass the lang 'js' or 'py'`
        );
    }
    if (isActive) {
      sdk.embedProject(
        "embed",
        {
          title: "Chroma Starter",
          description: "A basic setup to get started with chroma",
          template: lang == "js" ? "node" : "node", // Currently there is no python template, python is still experimental
          files,
        },
        {
          height: 700,
          width: "100%",
          clickToLoad: false,
          openFile: lang == "js" ? "index.js" : "main.py",
          view: "editor",
        }
      );
    }
  }, [isActive, chromaHost, chromaPort]);

  const handleHostChange = debounce((value) => {
    setChromaHost(value);
  }, 1000);

  const handlePortChange = debounce((value) => {
    setChromaPort(value);
  }, 1000);


  return (
    <>
      <p>
        Configure your Chroma Instance to play:
        <input
          style={{
            marginLeft: 10,
            width: 300,
          }}
          placeholder="localhost"
          onChange={(e) => handleHostChange(e.target.value)}
        />
        <input
          style={{
            marginLeft: 10,
            width: 50,
          }}
          placeholder="8000"
          onChange={(e) => handlePortChange(e.target.value)}
        />
      </p>
      <div id={isActive && "embed"}></div>
    </>
  );
}
