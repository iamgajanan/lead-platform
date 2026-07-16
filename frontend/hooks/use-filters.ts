"use client";

import { useMemo, useState } from "react";
import { Lead } from "@/types/lead";

export function useFilters(data: Lead[]) {

    const [search,setSearch]=useState("");

    const [websiteOnly,setWebsiteOnly]=useState(false);

    const [emailOnly,setEmailOnly]=useState(false);

    const [phoneOnly,setPhoneOnly]=useState(false);

    const [sortBy,setSortBy]=useState("rating");

    const filtered=useMemo(()=>{

        let items=[...data];

        if(search){

            items=items.filter(x=>

                x.name.toLowerCase().includes(search.toLowerCase()) ||

                x.address?.toLowerCase().includes(search.toLowerCase())

            );

        }

        if(websiteOnly){

            items=items.filter(x=>x.website);

        }

        if(emailOnly){

            items=items.filter(x=>x.email);

        }

        if(phoneOnly){

            items=items.filter(x=>x.phone);

        }

        switch(sortBy){

            case "rating":

                items.sort((a,b)=>

                    (b.rating??0)-(a.rating??0)

                );

                break;

            case "name":

                items.sort((a,b)=>

                    a.name.localeCompare(b.name)

                );

                break;

            case "reviews":

                items.sort((a,b)=>

                    (b.reviews??0)-(a.reviews??0)

                );

                break;

        }

        return items;

    },[

        data,

        search,

        websiteOnly,

        emailOnly,

        phoneOnly,

        sortBy

    ]);

    return{

        filtered,

        search,

        setSearch,

        websiteOnly,

        setWebsiteOnly,

        emailOnly,

        setEmailOnly,

        phoneOnly,

        setPhoneOnly,

        sortBy,

        setSortBy

    };

}