const Skeleton = ({ item }:any) => {
  return [...Array(item).keys()].map(() => (
    <div className="animate-pulse">
        <div className="h-20 w-20 bg-gray-200">

        </div>
    </div>
  ))
}

export default Skeleton