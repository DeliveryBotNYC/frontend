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

  // Photo uploder input State
  const [photoUpload, setPhotoUpload] = useState<string | null>(null);

  // Photo uploader input Function
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed top-1/2 ${
        contextValue?.showImageUploaderPopup === true
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300 shadow-dropdownShadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-themeLightBlack font-semibold text-lg">Upload</h3>

        {/* Close Icon */}
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {/* Documentation */}
      <div className="w-full mt-4">
        <p className="text-sm text-themeDarkGray mb-2">
          Bulk upload multiple delivery through a CSV file.
        </p>
      </div>

      {/* Image Uploader */}
      <div>
        <input
          type="file"
          id="imageUploader"
          className="hidden"
          onChange={handlePhotoUpload}
        />
        <label htmlFor="imageUploader">
          {photoUpload ? (
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <img
                src={photoUpload}
                alt="uploaded-image"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="h-[170px] flex flex-col items-center justify-center gap-2.5 px-2.5 mt-1 rounded-2xl cursor-pointer"
              style={{
                background: "rgba(172, 172, 172, 0.10)",
              }}
            >
              <div className="flex items-center justify-center">
                <img src={UplaodBlackIcon} alt="upload-black" />
              </div>

              <p className="text-sm text-black text-center">
                Drag and drop your files here
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Download CVS */}
      <p className="text-xs text-themeDarkBlue text-center mt-8">
        Download sample CVS file.
      </p>

      {/* Button */}
      <button
        onClick={closePopup}
        className="w-full bg-themeGreen mt-3 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
      >
        Continue
      </button>
    </div>
  );
};

export default ImageUploader;
