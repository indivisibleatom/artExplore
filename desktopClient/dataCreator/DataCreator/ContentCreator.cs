using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Net;
using System.IO;

namespace DataCreator
{
    public partial class ContentCreator : Form
    {
        private string m_filePath;
        private int m_width, m_height;
        public ContentCreator()
        {
            m_filePath = null;
            InitializeComponent();            
        }

        private void selectImageToolStripMenuItem_Click(object sender, EventArgs e)
        {
            openFileDialog1.Filter = "Image Files (*.jpg, *.png)|*.jpg;*.png";
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                m_filePath = openFileDialog1.FileName;
                pictureBox1.Image = new Bitmap(m_filePath);
                m_width = pictureBox1.Image.Width;
                m_height = pictureBox1.Image.Height;
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (m_filePath != null)
            {
                this.Hide();
                SpecifySubimage s = new SpecifySubimage(m_width, m_height, m_filePath);
                s.Show();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            openFileDialog1.Filter = "Vuforia data (*.xml)|*.xml";
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                this.Hide();
                SpecifyImageParameters s = new SpecifyImageParameters(openFileDialog1.FileName);
                s.Show();
            }
        }
    }
}
