import { ImageContext } from "../Communicator";
import { useState, useContext } from "react"
import { Input } from "../../input";
import { Button } from "../../button";


const SearchField = () => {
    const [searchValue, setSearchValue] = useState("");
    const { fetchData, setSearchImage } = useContext(ImageContext)

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleButtonSearch = () => {
        fetchData(`/api/v2/symbols?access_token=${import.meta.env.VITE_REACT_APP_ACCESS_KEY}&q=${searchValue}`);
        setSearchValue("");
        setSearchImage(searchValue);
    }

    const handleEnterSearch = (e) => {
        if(e.key === 'Enter') {
            fetchData(`/api/v2/symbols?access_token=${import.meta.env.VITE_REACT_APP_ACCESS_KEY}&q=${searchValue}`);
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
  )
}

export default SearchField