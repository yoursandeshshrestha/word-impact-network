"use client";

import React, { useState } from "react";

export default function VideoTestPage() {
  const [videoId, setVideoId] = useState("1105889531");
  const [hash, setHash] = useState("5265058146");
  const [embedCode, setEmbedCode] = useState("");

  const generateEmbedCode = () => {
    const embedHtml = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/${videoId}?h=${hash}&badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Test Video"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`;
    setEmbedCode(embedHtml);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Video Embed Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Generate Embed Code</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="videoId"
                className="block text-sm font-medium mb-2"
              >
                Video ID
              </label>
              <input
                id="videoId"
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="Enter Vimeo video ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="hash" className="block text-sm font-medium mb-2">
                Hash
              </label>
              <input
                id="hash"
                type="text"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter hash parameter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={generateEmbedCode}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generate Embed Code
            </button>
          </div>
        </div>

        {/* Embed Code Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Embed Code</h2>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {embedCode ||
                  'Click "Generate Embed Code" to create embed HTML'}
              </pre>
            </div>

            {embedCode && (
              <button
                onClick={copyToClipboard}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview */}
      {embedCode && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Video Preview</h2>
          <div className="w-full max-w-2xl mx-auto">
            <div dangerouslySetInnerHTML={{ __html: embedCode }} />
          </div>
        </div>
      )}

      {/* Test with your provided embed code */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Test with Provided Embed Code
        </h2>
        <div className="w-full max-w-2xl mx-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1105889531?h=5265058146&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="sdcsdcdscdsc"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
