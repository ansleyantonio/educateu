// type LoaderStyle = {
//   "--c": string;
//   background: string;
//   backgroundSize: string;
//   backgroundRepeat: string;
//   animation: string;
// };

// export const ListOfApplicationLoader = () => {
//   return (
//     <div
//       className="w-[56px] h-[56px]"
//       style={
//         {
//           "--c": "radial-gradient(farthest-side, #3B9DF8 92%, transparent)",
//           background: `
//           var(--c) 50% 0,
//           var(--c) 50% 100%,
//           var(--c) 100% 50%,
//           var(--c) 0 50%
//         `,
//           backgroundSize: "13.4px 13.4px",
//           backgroundRepeat: "no-repeat",
//           animation: "spinner-kh173p 1s infinite",
//         } as LoaderStyle
//       }
//     >
//       {/* Content of the Loader component */}
//     </div>
//   );
// };

const ListOfApplicationLoader = () => {
  const sharedStyle: React.CSSProperties = {
    content: "",
    width: "100%",
    height: "100%",
    display: "block",
    border: "5.6px solid #3B9DF8",
    borderRadius: "50%",
    boxShadow: "0 -33.6px 0 -5.6px #3B9DF8",
    position: "absolute", // or 'relative', 'fixed', etc.
    animation: "spinner-rotate 1.25s infinite ease",
  };

  return (
    <div className="relative w-[22.4px] h-[22.4px]">
      <div
        style={{
          ...sharedStyle,
          animation:
            "spinner-b4c8mmmd 0.5s backwards, spinner-rotate 1.25s 0.5s infinite ease",
        }}
      ></div>
      <div
        style={{
          ...sharedStyle,
          animationDelay: "0s, 1.25s",
        }}
      ></div>
      <style>
        {`
          @keyframes spinner-b4c8mmmd {
            from {
              box-shadow: 0 0 0 -5.6px #474bff;
            }
          }

          @keyframes spinner-rotate {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ListOfApplicationLoader;
