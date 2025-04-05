import { ImageContext } from "../Communicator";
import { useState, useContext } from "react";
import { Input } from "../../input";
import { Button } from "../../button";

const SearchField = () => {
    const [searchValue, setSearchValue] = useState("");
    const { fetchData, setSearchImage } = useContext(ImageContext);
    
    // Get API URL from environment
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleButtonSearch = () => {
        // Call our backend proxy instead of OpenSymbols directly
        fetchData(`${API_URL}/symbols?q=${searchValue}`);
        setSearchValue("");
        setSearchImage(searchValue);
    }

    const handleEnterSearch = (e) => {
        if(e.key === 'Enter') {
            // Call our backend proxy instead of OpenSymbols directly
            fetchData(`${API_URL}/symbols?q=${searchValue}`);
            setSearchValue("");
            setSearchImage(searchValue);
        }
    }

    return (
        <div className="flex p-1">
            <Input 
                type="search" 
                className=""
                placeholder="Search Symbols"
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleEnterSearch}
            />
            <Button
                onClick={handleButtonSearch}
                disabled={!searchValue}
            >Search</Button>
        </div>
    );
};

export default SearchField;