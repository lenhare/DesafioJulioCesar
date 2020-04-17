require('dotenv').config()
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const request = require('request')
const pasta = path.resolve(__dirname, 'tmp', 'answer.json')

const criarArquivo = () => {
   request(process.env.BASE_URL, (error, response, body) => {
    if (error) console.error('error:', error) 
    const result = body
    fs.writeFile(pasta, result, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('O arquivo foi criado.')
      }
    })
  })
}

const encode = texto => {
  const frase = crypto
    .createHash('sha1')
    .update(texto)
    .digest('hex')

  return frase
}

const resumoCripto = () => {
  fs.readFile(pasta, (err, data) => {
    if (err) {
      throw err
    }
    const dataJson = JSON.parse(data)
    const result = encode(dataJson.decifrado)
    dataJson['resumo_criptografico'] = result
    fs.writeFile(pasta, JSON.stringify(dataJson), err => {
      if (err) {
        console.log(err)
      } else {
        console.log("O resumo foi salvo. A sentença criptografada resumida é: " + result);
      }
    })
    return result
  })
}

const decodificarFrase = (frase, numero) => {
  // Fórmula Cripto de Cesar = (descriptografar) E (x) = (x - n) mod 26
  const num = numero < 0 ? 26 : numero
  let saida = ''

  for (let i = 0; i < frase.length; i++) {
    const code = frase.charCodeAt(i)
    let c = ''

    // Unicode 65 = A, 90 = Z
    if (code >= 65 && code <= 90) {
      c = String.fromCharCode((code - num) % 26)
    } 
    // Unicode 122 = z, 97 = a
    else if (code >= 97 && code <= 122) {
      if (code - num < 97) {
        c = String.fromCharCode(code - num + 122 - 97 + 1)
      } else {
        c = String.fromCharCode(code - num)
      }
    } else {
      // Unicode 32 = Espaço
      if (code === 32) {
        c = ' '
      } 
      // Unicode 58 = :
      else if (code === 58) {
        c = String.fromCharCode(code)
      } 
      // Unicode 46 = .
      else if (code === 46) {
        c = String.fromCharCode(code)
      }
    }
    saida += c
  }
  return saida
}

const salvarDecode = () => {
  fs.readFile(pasta, (err, data) => {
    if (err) {
      throw err
    }
    const dataJson = JSON.parse(data)
    const result = decodificarFrase(dataJson.cifrado, dataJson.numero_casas)
    dataJson['decifrado'] = result
    fs.writeFile(pasta, JSON.stringify(dataJson), err => {
      if (err) {
        console.log(err)
      } else {
        console.log("O arquivo foi decifrado. A frase decifrada é: "+result)
      }
    })
    return result
  })
}

const enviarArquivo = () => {
  const headers = {
    'Content-Type': 'multipart/form-data'
  }
  const r = request.post(
    { url: process.env.API_URL, headers },
    function optionalCallback (err, httpResponse, body) {
      if (err) {
        return console.error('Erro no envio:', err)
      }
      console.log('Arquivo enviado com sucesso! Servidor respondeu:', body)
    }
  )
  const form = r.form()
  form.append('answer', fs.createReadStream(pasta), {
    filename: 'answer.json'
  })
}

//
{
  //criarArquivo()
  //resumoCripto()
  //salvarDecode()
  enviarArquivo()
}
