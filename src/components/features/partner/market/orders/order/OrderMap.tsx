"use client";

import React from "react";
import { Map, Marker } from "pigeon-maps";

export type OrderMapProps = {
  center?: [number, number];
  zoom?: number;
  className?: string;
};

export default function OrderMap({
  center = [18.473, -69.89],
  zoom = 14,
  className = "h-64 md:h-96 w-full rounded-2xl overflow-hidden",
}: OrderMapProps) {
  return (
    <div className={className}>
      <Map defaultCenter={center} defaultZoom={zoom} animate metaWheelZoom>
        <Marker width={40} anchor={center} />
      </Map>
    </div>
  );
}
