using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;

namespace DataCreator
{
    public partial class SpecifySubimage : Form
    {
        private int m_width;
        private int m_height;
        private string m_filePath;

        public SpecifySubimage(int width, int height, string filePath)
        {
            InitializeComponent();
            m_width = width;
            m_height = height;
            m_filePath = filePath;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            int numCols;
            int numRows;
            if (int.TryParse(textBox1.Text, out numCols) && int.TryParse(textBox2.Text, out numRows))
            {
                if (folderBrowserDialog1.ShowDialog() == DialogResult.OK)
                {
                    string folderName = folderBrowserDialog1.SelectedPath;
                    int sizeGridX = m_width / numCols;
                    int sizeGridY = m_height / numRows;
                    
                    Process p = new Process();
                    FileInfo info = new FileInfo(m_filePath);
                    string name = info.Name;
                    for (int i = 0; i < numRows; i++)
                    {
                        for (int j = 0; j < numCols; j++)
                        {
                            p.StartInfo.FileName = @"c:\Installed\ImageMagick-6.8.4-3\convert.exe";
                            string offsetString= "+"+j*sizeGridX+"+"+i*sizeGridY;
                            p.StartInfo.Arguments = m_filePath + " -crop " + sizeGridX+"x"+sizeGridY+offsetString+" "+folderName+@"\grid"+i+j+".jpg";
                            p.StartInfo.UseShellExecute = false;
                            p.StartInfo.CreateNoWindow = true;
                            p.Start();
                            p.WaitForExit();
                        }
                    }
                }
            }
        }

        private void SpecifySubimage_FormClosed(object sender, FormClosedEventArgs e)
        {
            Form f = Application.OpenForms[0];
            f.Show();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
