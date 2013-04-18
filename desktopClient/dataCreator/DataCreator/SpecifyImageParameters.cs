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
using System.Xml;

namespace DataCreator
{
    public partial class SpecifyImageParameters : Form
    {
        string m_filePath;
        private string m_multiImageName;
        private int m_width;
        private int m_height;
        private int m_numRows;
        private int m_numCols;
        private int m_sizeGridX;
        private int m_sizeGridY;

        public SpecifyImageParameters(string path)
        {
            InitializeComponent();
            m_filePath = path;
            m_multiImageName = string.Empty;
        }

        private string getTranslationFor(int row, int column)
        {
            int x = m_sizeGridX / 2 + column * m_sizeGridX;
            int y = m_sizeGridY / 2 + row * m_sizeGridY;
            return x.ToString() + " " + y.ToString() + " 0";
        }

        private void appendMultiTargetPart(XmlWriter writer)
        {
            writer.WriteRaw("<MultiTarget name=\""+m_multiImageName+"\">");
            for (int i = 0; i < m_numRows; i++)
            {
                for (int j = 0; j < m_numCols; j++)
                {
                    writer.WriteRaw("<Part rotation=\"AD: 0 1 0 0\" translation=\""+getTranslationFor(i,j)+"\" name=\""+m_multiImageName+i.ToString()+j.ToString()+"\"/>");
                }
            }
            writer.WriteRaw("</MultiTarget>");
        }

        private void createXML()
        {
            XmlReader vuforiaXMLReader = XmlReader.Create(m_filePath);
            XmlWriter multiImageWriter = XmlWriter.Create(m_filePath+".tmp");
            while (vuforiaXMLReader.Read())
            {
                switch (vuforiaXMLReader.NodeType)
                {
                    case XmlNodeType.Element:
                        multiImageWriter.WriteStartElement(vuforiaXMLReader.Name);
                        multiImageWriter.WriteAttributes(vuforiaXMLReader, true);
                        if (vuforiaXMLReader.IsEmptyElement)
                        {
                            multiImageWriter.WriteEndElement();
                        }
                        if (vuforiaXMLReader.Name == "ImageTarget")
                        {
                            if (m_multiImageName == string.Empty)
                            {
                                string imageName = vuforiaXMLReader.GetAttribute("name");
                                StringBuilder multiImageBaseName = new StringBuilder();
                                foreach (char c in imageName)
                                {
                                    if (char.IsDigit(c))
                                    {
                                        break;
                                    }                                    
                                    multiImageBaseName.Append(c);                                    
                                }
                                m_multiImageName = multiImageBaseName.ToString();
                            }
                        }
                        break;
                    case XmlNodeType.Text:
                        multiImageWriter.WriteString(vuforiaXMLReader.Value);
                        break;
                    case XmlNodeType.XmlDeclaration:
                    case XmlNodeType.ProcessingInstruction:
                        multiImageWriter.WriteProcessingInstruction(vuforiaXMLReader.Name, vuforiaXMLReader.Value);
                        break;
                    case XmlNodeType.Comment:
                        multiImageWriter.WriteComment(vuforiaXMLReader.Value);
                        break;
                    case XmlNodeType.EndElement:
                        if (vuforiaXMLReader.Name == "Tracking")
                        {
                            appendMultiTargetPart(multiImageWriter);
                        }
                        multiImageWriter.WriteEndElement();
                        break;
                }
            }
            multiImageWriter.Close();
            vuforiaXMLReader.Close();
        }

        private void populateImageParams()
        {
            m_width = int.Parse(textBox3.Text);
            m_height = int.Parse(textBox4.Text);
            m_numCols = int.Parse(textBox5.Text);
            m_numRows = int.Parse(textBox6.Text);
            m_sizeGridX = m_width / m_numCols;
            m_sizeGridY = m_height / m_numRows;
        }

        private void button1_Click(object sender, EventArgs e)
        {
                populateImageParams();
                createXML();
             
                //string url = "http://localhost:8888/getInsertID";
                //HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
                //httpWebRequest.Method = "GET";
                //httpWebRequest.KeepAlive = true;
                //httpWebRequest.ContentType = "text/xml; encoding='utf-8'";
               
                //WebResponse response = httpWebRequest.GetResponse();
                //Stream objStream = response.GetResponseStream();
                //objStream.Read(b, 0, (int)response.ContentLength);
                //string id = BitConverter.ToString(b, 0);
                //objStream.Close();

                string url = "http://localhost:8888/uploadXML";
                HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
                httpWebRequest.Method = "POST";
                httpWebRequest.KeepAlive = true;
                httpWebRequest.ContentType = "text/xml; encoding='utf-8'";
                Stream memStream = new MemoryStream();
                string[] files = { m_filePath+".tmp" };
                foreach (string file in files)
                {
                    FileStream fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
                    byte[] buffer = new byte[1024];
                    int bytesRead = 0;
                    while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0)
                    {
                        memStream.Write(buffer, 0, bytesRead);
                    }
                    fileStream.Close();
                }
                httpWebRequest.ContentLength = memStream.Length;
                Stream requestStream = httpWebRequest.GetRequestStream();
                memStream.Position = 0;
                byte[] tempBuffer = new byte[memStream.Length];
                memStream.Read(tempBuffer, 0, tempBuffer.Length);
                memStream.Close();
                requestStream.Write(tempBuffer, 0, tempBuffer.Length);
                requestStream.Close();

                m_filePath = m_filePath.Replace(".xml",".dat");
                url = "http://localhost:8888/uploadDAT";
                httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
                httpWebRequest.Method = "POST";
                httpWebRequest.KeepAlive = true;
                httpWebRequest.ContentType = "application/octet-stream";
                memStream = new MemoryStream();
                string[] files1 = { m_filePath };
                foreach (string file in files1)
                {
                    FileStream fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
                    byte[] buffer = new byte[1024];
                    int bytesRead = 0;
                    while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0)
                    {
                        memStream.Write(buffer, 0, bytesRead);
                    }
                    fileStream.Close();
                }
                httpWebRequest.ContentLength = memStream.Length;
                requestStream = httpWebRequest.GetRequestStream();
                memStream.Position = 0;
                tempBuffer = new byte[memStream.Length];
                memStream.Read(tempBuffer, 0, tempBuffer.Length);
                memStream.Close();
                requestStream.Write(tempBuffer, 0, tempBuffer.Length);
                requestStream.Close();

                url = "http://localhost:8888/updateDBs?LATITUDE="+textBox1.Text+"&LONGITUDE="+textBox2.Text+"&X_SIZE="+textBox5.Text+"&Y_SIZE="+textBox6.Text+"&Z_SIZE="+textBox7.Text+"&WIDTH="+textBox3.Text+"&HEIGHT="+textBox4.Text;
                httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
                httpWebRequest.Method = "GET";
                httpWebRequest.KeepAlive = true;
                httpWebRequest.ContentType = "text/xml; encoding='utf-8'";
                Stream objStream = httpWebRequest.GetResponse().GetResponseStream();
                File.Delete(m_filePath + ".tmp");
        }

        private void SpecifyImageParameters_Load(object sender, EventArgs e)
        {

        }

        private void label2_Click(object sender, EventArgs e)
        {

        }

        private void textBox2_TextChanged(object sender, EventArgs e)
        {

        }
    }
}
