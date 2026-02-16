{/* ==============================
   BOTTOM CONTROL BAR
============================== */}
<div className="fixed bottom-0 left-0 right-0 z-50 h-10">

  <div className="bg-neutral-900 border-t border-neutral-800 h-full flex items-center justify-between px-[14px] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">

    {/* ================= LEFT SIDE ================= */}
    <div className="flex items-center gap-3">

      {/* HAMBURGER */}
      <div className="w-6 h-6 flex flex-col justify-center gap-[3px] cursor-pointer">
        <div className="h-[2px] bg-neutral-400" />
        <div className="h-[2px] bg-neutral-400" />
        <div className="h-[2px] bg-neutral-400" />
      </div>

      {/* BRAND TEXT */}
      <div className="flex items-center">
        <div className="text-[15px] font-semibold tracking-wide leading-none">
          FXHEDZ
        </div>
      </div>

    </div>

    {/* ================= RIGHT SIDE ================= */}
    <div className="flex items-center gap-3">

      {/* SMALL BOX (MIN) */}
      <button
        onClick={() => {
          setViewMode("MIN")
          setOpenPair(null)
        }}
        className={`transition-all duration-200 rounded-sm
          ${viewMode === "MIN"
            ? "bg-white"
            : "bg-neutral-700 hover:bg-neutral-500"
          }`}
        style={{ width: 10, height: 10 }}
      />

      {/* MEDIUM BOX (MID) */}
      <button
        onClick={() => setViewMode("MID")}
        className={`transition-all duration-200 rounded-sm
          ${viewMode === "MID"
            ? "bg-white"
            : "bg-neutral-700 hover:bg-neutral-500"
          }`}
        style={{ width: 14, height: 14 }}
      />

      {/* LARGE BOX (MAX) */}
      <button
        onClick={() => setViewMode("MAX")}
        className={`transition-all duration-200 rounded-sm
          ${viewMode === "MAX"
            ? "bg-white"
            : "bg-neutral-700 hover:bg-neutral-500"
          }`}
        style={{ width: 18, height: 18 }}
      />

    </div>

  </div>
</div>
