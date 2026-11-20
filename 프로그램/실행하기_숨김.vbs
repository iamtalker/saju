Option Explicit

Dim args, shell, fso, nodeExe, serverFile, port, logFile, command
Set args = WScript.Arguments
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

nodeExe = args(0)
serverFile = args(1)
port = args(2)
logFile = fso.BuildPath(fso.GetParentFolderName(serverFile), "server.log")
shell.CurrentDirectory = fso.GetParentFolderName(serverFile)
shell.Environment("PROCESS")("SAJU_PORT") = port
command = "cmd /c " & Chr(34) & Quote(nodeExe) & " " & Quote(serverFile) & " > " & Quote(logFile) & " 2>&1" & Chr(34)
shell.Run command, 0, False

Function Quote(value)
  Quote = Chr(34) & value & Chr(34)
End Function
