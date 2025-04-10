class CuteVM {
    constructor(code) {
        this.stack = []
        this.funcPtr = {}
        this.reg = { EAX: 0, EBX: 0, ECX: 0, EDX: 0, ESP: 0, EBP: 0, EIP: 0 }
        this.code = code.split("\n")
        for (let i in code) {
            let instruction = this.code[i]
            if (instruction == undefined || instruction == "") {
                continue
            }
            if (instruction.includes(";")) {
                instruction = instruction.slice(0, code.lastIndexOf(";"))
            }
            if (instruction[instruction.length - 1] == ":") {
                this.funcPtr[instruction.slice(0, instruction.length - 1)] = parseInt(i)
            }
        }
        if (this.funcPtr["main"] != undefined) {
            this.reg.EIP = this.funcPtr["main"] + 1
        }
    }

    Next() {
        let code = this.code[this.reg.EIP]
        if (code == undefined) {
            this.reg.EIP++
            return
        }
        if (code.includes(";")) {
            code = code.slice(0, code.lastIndexOf(";"))
        }
        let instruction = this.Parse(code)
        if (instruction == undefined || code.length == 0 || code[code.length - 1] == ":") {
            this.reg.EIP++
            return
        }
        if (this[instruction.name]) {
            if (instruction.args.length > 0) {
                this[instruction.name](...instruction.args)
            } else {
                this[instruction.name]()
            }
        }
        this.reg.EIP++
    }

    Parse(instruction) {
        if (instruction.length > 0 && instruction[instruction.length - 1] != ":") {
            let tmp = { name: "", args: [] }
            if (instruction.includes(" ")) {
                instruction = instruction.trim()
                tmp.name = instruction.split(" ")[0].toUpperCase()
                let args = instruction.slice(instruction.indexOf(" ") + 1).split(",")
                for (let i in args) {
                    let arg = args[i].trim()
                    if (this.reg[arg.toUpperCase()] != undefined) {
                        tmp.args.push({ reg: arg.toUpperCase(), type: 0 })
                    } else if (arg[0] == "[" && arg[arg.length - 1] == "]") {
                        let content = arg.slice(1, arg.length - 1)
                        tmp.args.push({ reg: content.slice(0, 4).toUpperCase(), Offset: parseInt(content.slice(3)), type: 1 })
                    } else {
                        tmp.args.push({ content: arg, type: 2 })
                    }
                }
            } else {
                instruction = instruction.trim()
                tmp.name = instruction.split(" ")[0].toUpperCase()
            }
            return tmp
        }
    }

    getLength(size) {
        return {
            "BYTE": 1,
            "WORD": 2,
            "DWORD": 4,
            "QWORD": 8
        }[size.toUpperCase()] || 0
    }


    MOV(arg1, arg2) {
        let content;
        switch (arg2.type) {
            case 0:
                content = this.reg[arg2.reg]
                break
            case 1:
                content = this.stack[arg2.reg + arg2.Offset]
                break
            case 2:
                content = parseFloat(arg2.content)
                break
        }
        switch (arg1.type) {
            case 0:
                this.reg[arg1.reg] = content
                break
            case 1:
                this.stack[arg1.reg + arg1.Offset] = content
                break
            case 2:
                this.error(6)
                return
        }
    }

    ADD(arg1, arg2) {
        let content;
        switch (arg2.type) {
            case 0:
                content = parseFloat(this.reg[arg2.reg])
                break
            case 1:
                content = parseFloat(this.stack[arg2.reg + arg2.Offset])
                break
            case 2:
                content = parseFloat(arg2.content)
                break
        }
        switch (arg1.type) {
            case 0:
                this.reg[arg1.reg] += content
                break
            case 1:
                this.stack[arg1.reg + arg1.Offset] += content
                break
            case 2:
                this.error(6)
                return
        }
    }

    SUB(arg1, arg2) {
        let content;
        switch (arg2.type) {
            case 0:
                content = parseFloat(this.reg[arg2.reg])
                break
            case 1:
                content = parseFloat(this.stack[arg2.reg + arg2.Offset])
                break
            case 2:
                content = parseFloat(arg2.content)
                break
        }
        switch (arg1.type) {
            case 0:
                this.reg[arg1.reg] -= content
                break
            case 1:
                this.stack[arg1.reg + arg1.Offset] -= content
                break
            case 2:
                this.error(6)
                return
        }
    }

    PUSH(arg1) {
        let content;
        switch (arg1.type) {
            case 0:
                content = parseFloat(this.reg[arg1.reg])
                break
            case 1:
                content = parseFloat(this.stack[arg1.reg + arg1.Offset])
                break
            case 2:
                content = parseFloat(arg1.content)
                break
        }
        this.reg.ESP--
        if (-this.reg.ESP > this.stack.length) {
            this.stack.push(content)
        } else {
            this.stack[-this.reg.ESP - 1] = content
        }
    }

    POP(arg1) {
        let content = this.stack[-this.reg.ESP - 1]
        this.reg.ESP++
        switch (arg1.type) {
            case 0:
                this.reg[arg1.reg] = content
                break
            case 1:
                this.stack[arg1.reg + arg1.Offset] = content
                break
            case 2:
                this.error(6)
                return
        }
    }

    CALL(arg1) {
        switch (arg1.type) {
            case 0:
                this.error(6)
                returnd
            case 1:
                this.error(6)
                return
            case 2:
                if (this.funcPtr[arg1.content] == undefined) {
                    this.error(5)
                    return
                }
                this.PUSH({ reg: "EIP", type: 0 })
                this.reg.EIP = this.funcPtr[arg1.content]
        }
    }

    RET() {
        let content = this.stack[-this.reg.ESP - 1]
        this.reg.EIP = content
    }

    error(idt) {
        let idtList = [
            "",
            "",
            "",
            "",
            "",
            "",
            "Invaild Opcode",
        ]
        console.error(idtList[idt])
    }
}
