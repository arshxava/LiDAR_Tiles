("use client");

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminStats from "../AdminStats";
import axios from "axios";

export default function MapDashboardPage() {
    const { id } = useParams(); // Get map ID from URL
    const [tiles, setTiles] = useState([]);
    const [loading, setLoading] = useState(true);
   const baseUrl= process.env.NEXT_PUBLIC_LIDAR_APP_PROD_URL || http://localhost:5000 ;

    useEffect(() => {
        const fetchTiles = async () => {
            try {
                const res = await axios.get(
                    `${baseUrl}/api/maps/${id}/tiles`
                );
                setTiles(res.data);
            } catch (err) {
                console.error("Failed to fetch tiles", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTiles();
    }, [id]);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Admin Tile Dashboard</h1>
            {loading ? <p>Loading tiles...</p> : <AdminStats tiles={tiles} />}
        </div>
    );
}
