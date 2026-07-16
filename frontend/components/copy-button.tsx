"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopyButton({

    value

}:{

    value:string

}){

    function copy(){

        navigator.clipboard.writeText(value);

        toast.success("Copied");

    }

    return(

        <button

            onClick={copy}

            className="hover:text-blue-600"

        >

            <Copy

                className="w-4 h-4"

            />

        </button>

    );

}