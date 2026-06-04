interface Text {
  text: string;
  setText: (text: string) => void;
}
export default function useText(): Text {
  return {
    text: "",
    setText: () => {},
  };
}
