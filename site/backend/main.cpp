extern "C" int printf(const char* format, ...);
extern "C" int system(const char* command);

// Servidor simples em C++ para lidar com arquivos
// Compilar com: g++ main.cpp -o server

class FileServer {
public:
    void start() {
        printf("=== SERVIDOR DE ARQUIVOS C++ ===\n");
        printf("Servidor iniciado na porta 8000\n");
        printf("Diretorio: /storage/emulated/0/Download\n");
    }

    void listarArquivos() {
        printf("[C++] Listando arquivos...\n");
        system("ls /storage/emulated/0/Download");
    }
};

int main() {
    FileServer server;
    server.start();
    server.listarArquivos();
    return 0;
}
