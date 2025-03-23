const Image = ({ data }:any) => {
  return (
        <img className="h-20 w-20 object-cover" 
        src={data.image_url} 
        alt={data.name}/>
  )
}

export default Image