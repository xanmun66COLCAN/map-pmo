package com.example.mappmo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class DashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Botón Salir
        val btnLogout = findViewById<Button>(R.id.btnLogout)
        btnLogout.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        // Navegación a Comités / Lista de Iniciativas
        val navCommittees = findViewById<TextView>(R.id.navCommittees)
        navCommittees.setOnClickListener {
            val intent = Intent(this, ListaIniciativasActivity::class.java)
            startActivity(intent)
        }

        // Navegación a Logs (Admin)
        val navLogs = findViewById<TextView>(R.id.navLogs)
        navLogs.setOnClickListener {
            val intent = Intent(this, AdminActivity::class.java)
            startActivity(intent)
        }

        // Clic en la tarjeta de iniciativa del Dashboard para ver su Detalle
        val cardInitiativeDetail = findViewById<LinearLayout>(R.id.cardInitiativeDetail)
        cardInitiativeDetail.setOnClickListener {
            val intent = Intent(this, DetalleProyectoActivity::class.java)
            startActivity(intent)
        }
    }
}
