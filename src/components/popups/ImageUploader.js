import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState } from "react";
import CloseIcon from "../../assets/close-gray.svg";
import UplaodBlackIcon from "../../assets/upload-black.svg";
import { ThemeContext } from "../../context/ThemeContext";
const ImageUploader = () => {
    // Context
    const contextValue = useContext(ThemeContext);
    //   Close Popup Function
    const closePopup = () => {
        contextValue?.setShowImageUploaderPopup(false);
    };
    // uploder input State
    const [upload, setUpload] = useState(null);
    // Photo uploader input Function
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0].name;
        console.log(file);
        if (file)
            setUpload(file);
    };
    return (_jsxs("div", { className: `w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed top-1/2 ${contextValue?.showImageUploaderPopup === true
            ? contextValue?.showPopupStyles
            : contextValue?.hidePopupStyles} -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300 shadow-dropdownShadow`, children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: "text-themeLightBlack font-semibold text-lg", children: "Upload" }), _jsx("div", { onClick: closePopup, children: _jsx("img", { src: CloseIcon, alt: "close-icon", className: "cursor-pointer" }) })] }), _jsx("div", { className: "w-full mt-4", children: _jsx("p", { className: "text-sm text-themeDarkGray mb-2", children: "Bulk upload multiple delivery through a CSV file." }) }), _jsxs("div", { children: [_jsx("input", { type: "file", accept: ".csv", id: "imageUploader", className: "hidden", onChange: handlePhotoUpload }), _jsx("label", { htmlFor: "imageUploader", children: upload ? (_jsx("div", { className: "w-full h-full rounded-2xl overflow-hidden", children: upload })) : (_jsxs("div", { className: "h-[170px] flex flex-col items-center justify-center gap-2.5 px-2.5 mt-1 rounded-2xl cursor-pointer", style: {
                                background: "rgba(172, 172, 172, 0.10)",
                            }, children: [_jsx("div", { className: "flex items-center justify-center", children: _jsx("img", { src: UplaodBlackIcon, alt: "upload-black" }) }), _jsx("p", { className: "text-sm text-black text-center", children: "Drag and drop your files here" })] })) })] }), _jsx("p", { className: "text-xs text-themeDarkBlue text-center mt-8", children: "Download sample CVS file." }), _jsx("button", { onClick: closePopup, className: "w-full bg-themeGreen mt-3 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200", children: "Continue" })] }));
};
export default ImageUploader;
