package com.example.mappmo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Carga tu diseño de inicio de sesión
        setContentView(R.layout.activity_login)

        // 1. Buscamos el botón de inicio de sesión por su ID (asegúrate de que en tu activity_login.xml 
        // el botón tenga un id como android:id="@+id/btnLogin" o similar)
        val btnLogin = findViewById<Button>(R.id.btnLogin)

        // 2. Programamos la acción al hacer clic
        btnLogin.setOnClickListener {
            // Creamos un Intent para navegar hacia la actividad o pantalla del Dashboard
            // Nota: Si el Dashboard lo tienes maquetado en otra Activity (ej. DashboardActivity), 
            // la colocamos aquí. Si prefieres abrir otro XML directamente, se ajusta.
            val intent = Intent(this, DashboardActivity::class.java)
            startActivity(intent)
        }
    }
}