import { useContext} from "react";
import { ImageContext } from "../Communicator";
import Image from "./Image";
import Skeleton from "./Skeleton";

const Images = () => {
    const { response, isLoading, searchImage, selectedImage, setSelectedImage } = useContext(ImageContext);

    return (
        <>
            <h1>Results for: {searchImage || 'Cats'}</h1>
            <div className="grid h-50 md:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-4 my-10 max-w-7x1 mx-auto px-2 overflow-y-scroll">
                
                {isLoading ? <Skeleton item={6} /> : response.map((data, key) => {
                    return (
                        <div key={key} className={selectedImage === data.image_url ? "border-3 border-blue-500" : ""}>
                            <button onClick={() => setSelectedImage(data.image_url)}>
                                <Image data={data} />
                            </button>
                        </div>
                    )
                })}
                
            </div>
            <h1>{selectedImage ? "Image Selected" : "None selected"}</h1>
        </>
    )
};

export default Images