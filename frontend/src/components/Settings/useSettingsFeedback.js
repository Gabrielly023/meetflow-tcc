import { useEffect, useRef, useState } from "react";

export default function useSettingsFeedback() {
  const [feedback, setFeedback] = useState(null);
  const timeout = useRef(null);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  function showFeedback(texto, tipo = "sucesso") {
    window.clearTimeout(timeout.current);
    setFeedback({ texto, tipo });
    timeout.current = window.setTimeout(() => setFeedback(null), 4000);
  }

  return { feedback, showFeedback };
}
