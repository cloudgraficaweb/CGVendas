@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

REM Diretório de atualização
set "url=https://github.com/cloudgraficaweb/CGVendas/releases/download/atual/CloudApp.zip"
set "updateDirectory=%~dp0"
set "zipFileName=CloudApp.zip"
set "programaPrincipal=%updateDirectory%CloudApp.exe"

:check_program
REM Verifica se o programa está em execução
tasklist /FI "IMAGENAME eq CloudApp.exe" 2>NUL | find /I /N "CloudApp.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo O programa CloudApp.exe está em execução.
    echo Tentando fechar o programa...
    taskkill /F /IM CloudApp.exe >nul 2>&1
    
    REM Aguarda um momento e verifica novamente
    timeout /t 2 >nul
    tasklist /FI "IMAGENAME eq CloudApp.exe" 2>NUL | find /I /N "CloudApp.exe">NUL
    if "!ERRORLEVEL!"=="0" (
        cls
        echo.
        echo ****************************************************
        echo *                                                  *
        echo *        FECHE O PROGRAMA PARA ATUALIZAR           *
        echo *                                                  *
        echo * Pressione qualquer tecla quando fechar o programa*
        echo *    ou feche esta janela para cancelar            *
        echo *                                                  *
        echo ****************************************************
        echo.
        pause >nul
        goto check_program
    )
)

REM Realiza o download do arquivo zip
echo Baixando Nova Atualização...
powershell -command "& { Invoke-WebRequest '%url%' -OutFile '%updateDirectory%%zipFileName%' }"
if !ERRORLEVEL! neq 0 (
    echo Erro ao baixar a atualização.
    pause
    exit /b 1
)
echo Download concluído.

REM Verifica novamente se o programa está em execução antes de extrair
:check_program_again
tasklist /FI "IMAGENAME eq CloudApp.exe" 2>NUL | find /I /N "CloudApp.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo O programa CloudApp.exe está em execução.
    echo Tentando fechar o programa...
    taskkill /F /IM CloudApp.exe >nul 2>&1
    
    REM Aguarda um momento e verifica novamente
    timeout /t 2 >nul
    tasklist /FI "IMAGENAME eq CloudApp.exe" 2>NUL | find /I /N "CloudApp.exe">NUL
    if "!ERRORLEVEL!"=="0" (
        cls
        echo.
        echo ****************************************************
        echo *                                                  *
        echo *        FECHE O PROGRAMA PARA ATUALIZAR           *
        echo *                                                  *
        echo * Pressione qualquer tecla quando fechar o programa*
        echo *    ou feche esta janela para cancelar            *
        echo *                                                  *
        echo ****************************************************
        echo.
        pause >nul
        goto check_program_again
    )
)

REM Extrai o conteúdo do arquivo zip
echo Extraindo arquivos...
powershell -command "& { Expand-Archive -Path '%updateDirectory%%zipFileName%' -DestinationPath '%updateDirectory%' -Force }"
if !ERRORLEVEL! neq 0 (
    echo Erro ao extrair os arquivos.
    pause
    exit /b 1
)
echo Extração concluída.

REM Verifica se o programa principal existe após a extração
if exist "%programaPrincipal%" (
    echo Programa principal encontrado. Iniciando a aplicação.
    start "" "%programaPrincipal%"
    echo Aplicação iniciada.
    exit /b 0
) else (
    echo ERRO: Arquivo do programa principal não encontrado após a atualização.
    pause
    exit /b 1
)