import React from 'react';
import { PricingTable } from "@clerk/nextjs";

function BillingPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-10 text-center md:text-left">
                Manage your billing
            </h1>

            <PricingTable />
        </div>
    );
}

export default BillingPage;
