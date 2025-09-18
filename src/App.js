import React, { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  // Nosso novo estado de progresso! É um objeto para mais flexibilidade.
  const [progress, setProgress] = useState({ active: false, message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDownload = async () => {
    setError("");
    setSuccess("");

    if (!url) {
      setError("Por favor, insira uma URL do YouTube.");
      return;
    }

    setProgress({
      active: true,
      message: "Iniciando conexão com o servidor...",
    });
    try {
      // Pequeno timeout para o usuário ver a primeira mensagem
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress({
        active: true,
        message:
          "Processando... Para playlists, isso pode demorar vários minutos. Por favor, aguarde.",
      });

      const response = await fetch(
        `http://localhost:3001/download?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Erro no servidor: ${response.status}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "download.mp3";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(escape(filenameMatch[1])); // Lida com caracteres especiais
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(
        "Download iniciado com sucesso! Verifique sua pasta de downloads."
      );
    } catch (err) {
      console.error("Erro ao baixar:", err);
      setError(
        `Falha no download: ${err.message}. Verifique a URL e o console do backend.`
      );
    } finally {
      // Limpa o progresso ao finalizar
      setProgress({ active: false, message: "" });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Baixador de MP3 do YouTube</h1>
        <p>Cole o link de um vídeo ou de uma playlist do YouTube.</p>

        <div className="input-container">
          <input
            type="text"
            placeholder="Cole sua URL aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={progress.active} // Desabilita o input durante o loading
          />
          <button onClick={handleDownload} disabled={progress.active}>
            {progress.active ? "Processando..." : "Baixar MP3"}
          </button>
        </div>

        {/* --- NOSSA NOVA SEÇÃO DE PROGRESSO --- */}
        {progress.active && (
          <div className="progress-container">
            <p className="progress-message">{progress.message}</p>
            <div className="progress-bar">
              <div className="progress-bar-inner"></div>
            </div>
          </div>
        )}
        {/* --- FIM DA SEÇÃO DE PROGRESSO --- */}

        {success && !progress.active && (
          <p className="success-message">{success}</p>
        )}
        {error && !progress.active && <p className="error-message">{error}</p>}
      </header>
    </div>
  );
}

export default App;
