Option Explicit

Dim args, shell, fso, nodeExe, serverFile, port
Set args = WScript.Arguments
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

nodeExe = args(0)
serverFile = args(1)
port = args(2)
shell.CurrentDirectory = fso.GetParentFolderName(serverFile)
shell.Environment("PROCESS")("SAJU_PORT") = port
shell.Run Quote(nodeExe) & " " & Quote(serverFile), 0, False
WScript.Sleep 1200
shell.Run "http://127.0.0.1:" & port, 1, False

Function Quote(value)
  Quote = Chr(34) & value & Chr(34)
End Function
