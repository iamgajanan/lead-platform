"use client";

import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/services/api";

import { SearchResponse } from "@/types/lead";

export function useSearch(){

    const [loading,setLoading]=useState(false);

    const [data,setData]=useState<SearchResponse | null>(null);

    async function search(

        keyword:string,

        location:string

    ){

        try{

            setLoading(true);

            const response=await api.post<SearchResponse>(

                "/search",

                {

                    keyword,

                    location

                }

            );

            setData(response.data);

            toast.success(

                `${response.data.count} Businesses Found`

            );

        }

        catch(err:any){

            toast.error(

                err?.response?.data?.detail ||

                "Server Error"

            );

        }

        finally{

            setLoading(false);

        }

    }

    return{

        loading,

        data,

        search

    };

}