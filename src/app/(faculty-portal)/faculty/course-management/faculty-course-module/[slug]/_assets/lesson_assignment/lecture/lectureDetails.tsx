import { Video } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const LectureDetails = ({ lectures }: { lectures: any }) => {
  return (
    <div>
      {lectures?.map((lecture: any, i: number) => (
        <div
          key={i}
          className="flex gap-2 justify-between items-center p-2 mb-2 border-b-2 border-gray-200 hover:bg-gray-300/10"
        >
          <div className="flex gap-2 items-center">
            <div>
              <Video className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{lecture.name}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{lecture.duration}</p>
        </div>
      ))}
    </div>
  );
};

export default LectureDetails;
