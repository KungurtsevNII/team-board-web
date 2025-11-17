import { useState } from "react"
import "./AuthField.css"
import iconEye from "/src/assets/eye.png"
import iconHidden from "/src/assets/hidden.png"

/**
 * AuthField component that handles both login and registration forms
 * It toggles between login and registration views based on user preference
 */
export const AuthField = () => {
    const [isLogin, setIsLogin] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [passType, setPassType] = useState('password');

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const handlePasswordVisibility = (
        passVisible: boolean = isPasswordVisible, 
        passTypeInput: string = passType
    ) => {
        setPassType(passTypeInput === 'password' ? 'text' : 'password')
        setIsPasswordVisible(!passVisible)
    }

    const handleLogin = (isLogin: boolean) => {
        setIsLogin(isLogin)
        handlePasswordVisibility(true, 'text') //Инвертируем

        setName('')
        setEmail('')
        setPassword('')
    }

    const OnSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
        //TODO: доделать вход
        alert('Вход')
        e.preventDefault()
    }

    const OnSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
        //TODO: доделать регистрацию
        alert('Регистрация')
        e.preventDefault()
    }

    return (
       <>
       <div className="auth-field">
           <div className="login-field">
            {
                isLogin
                ? 
                <div className="login-field-form">
                    <form className="login-form" onSubmit={OnSubmitLogin}>
                        <h1 className="title-form">Вход</h1>
                        <p><input 
                            type="email" 
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /></p>
                                
                        <p className="form-password-field">
                            <input 
                                className= "form-password-input" 
                                type={passType} 
                                placeholder="пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={isPasswordVisible ? iconEye : iconHidden}
                                className="eye-icon"
                                alt="show"
                                onClick={() => handlePasswordVisibility()}
                            />
                        </p>
                        <p><button>продолжить</button></p>
                    </form>
                    <p><button className="another-form-button" onClick={() => handleLogin(false)}>регистрация</button></p>
                </div>
                :
                <div className="login-field-form">
                    <form className="login-form" onSubmit={OnSubmitRegister}>
                        <h1 className="title-form">Регистрация</h1>
                        <p><input 
                            type="text" 
                            placeholder="имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        /></p>
                        <p><input 
                            type="email" 
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /></p>
                        <p className="form-password-field">
                            <input 
                                type={passType} 
                                className= "form-password-input" 
                                placeholder="пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <img
                                src={isPasswordVisible ? iconEye : iconHidden}
                                onClick={() => handlePasswordVisibility()}
                                className="eye-icon"
                                alt="show"
                            />
                        </p>
                        <p><button>продолжить</button></p>
                    </form>
                    <p><button className="another-form-button" onClick={() => handleLogin(true)}>войти</button></p>
                </div>
            }
            </div>
       </div>
        <div className="logo-anchor">
            <img className = "samgtu-logo" src="src/assets/samgtu_logo.png" alt="" />
        </div>
       </>
    )
}