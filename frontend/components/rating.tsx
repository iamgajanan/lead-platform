import { Star } from "lucide-react";

export default function Rating({
    rating,
}:{
    rating:number | null
}){

    if(!rating)
        return null;

    return(

        <div className="flex items-center gap-1">

            <Star
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />

            <span className="font-semibold">

                {rating}

            </span>

        </div>

    );

}