/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Page = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-lg rounded-2xl p-4">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-green-600">
                        Payment Successful
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center space-y-3">
                    <p className="text-lg">✅ Manual payment submitted successfully!</p>
                    {/* <p className="text-gray-600">
                        You can now close this page or return to the dashboard.
                    </p> */}
                </CardContent>
            </Card>
        </div>
    );
};

export default Page;