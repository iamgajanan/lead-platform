"use client";

import { useState } from "react";

import {

    Search,

    MapPin,

    Loader2

} from "lucide-react";

import {

    Button

} from "@/components/ui/button";

import {

    Input

} from "@/components/ui/input";

type Props={

    loading:boolean

    onSearch:(

        keyword:string,

        location:string

    )=>void

}

export default function SearchForm({

    loading,

    onSearch

}:Props){

    const [keyword,setKeyword]=useState("Dentist");

    const [location,setLocation]=useState("Pune");
    console.log("SearchForm Loaded");

  function submit(e: React.FormEvent) {
    e.preventDefault();

    console.log("Searching...");

    onSearch(keyword, location);
}

    return(

        <form

            onSubmit={submit}

            className="bg-white rounded-xl border p-6 shadow-sm"

        >

            <div className="grid lg:grid-cols-3 gap-5">

                <div className="relative">

                    <Search

                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"

                    />

                    <Input

                        className="pl-10"

                        value={keyword}

                        onChange={(e)=>setKeyword(e.target.value)}

                        placeholder="Keyword"

                    />

                </div>

                <div className="relative">

                    <MapPin

                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"

                    />

                    <Input

                        className="pl-10"

                        value={location}

                        onChange={(e)=>setLocation(e.target.value)}

                        placeholder="Location"

                    />

                </div>

                <Button

                    disabled={loading}
                        type="submit"


                >

                    {

                        loading ?

                        <>

                            <Loader2

                                className="mr-2 h-4 w-4 animate-spin"

                            />

                            Searching...

                        </>

                        :

                        "Search Leads"

                    }

                </Button>

            </div>

        </form>

    );

}