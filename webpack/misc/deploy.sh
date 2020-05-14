#!/bin/bash
# run me as root on a fresh installation of Ubuntu 14.04.5 LTS x64
apt-get update

echo "Installing dependencies"
apt-get install apache2 git git-core libapache2-mod-wsgi python-pip
echo "Dependencies installed."

echo "Readying folder permissions."
chown -R gs:gs /var/www/html
cd /var/www/html/
rm /var/www/html/index.html

echo "Retrieving source."
git clone https://kwu_epe@bitbucket.org/epeconsulting/gs_frontend.git /var/www/html
git checkout django
chown -R gs:gs /var/www/html/
chmod -R 777 /var/www/html/esri/php
chmod -R 777 /var/www/html/wsgi/

echo "Preparing Apache."
cat > /etc/apache2/sites-available/000-default.conf <<EOL
WSGIPythonPath /var/www/html/wsgi
<VirtualHost *:80>
	ServerAdmin it@epeconsulting.com
	DocumentRoot /var/www/html
	
	<Directory "/var/www/html">
		AllowOverride All
	</Directory>


	<IfModule wsgi_module>
		WSGIScriptAlias /gs /var/www/html/wsgi/wsgi/wsgi.py
		<Directory "/var/www/html/wsgi/wsgi/">
			<Files wsgi.py>
				Require all granted
			</Files>
		</Directory>

		Alias /static/admin/ /usr/local/lib/python2.7/dist-packages/django/contrib/admin/static/admin/
		<Directory "/usr/local/lib/python2.7/dist-packages/django/contrib/admin/static/admin/">
			Require all granted
		</Directory>

		Alias /static/smart-selects/admin/ /usr/local/lib/python2.7/dist-packages/smart_selects/static/smart-selects/admin/
		<Directory "/usr/local/lib/python2.7/dist-packages/smart_selects/static/smart-selects/admin/">
			Require all granted
		</Directory>

		Alias /static/ /var/www/html/wsgi/gs/static/
		<Directory "/var/www/html/wsgi/gs/static/">
			Require all granted
		</Directory>
	</IfModule>

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
EOL

echo "Installing Python dependencies."
pip2 install django django-admin django-smart-selects psycopg2

# TODO PostgreSQL instead of SQLite
echo "Preparing database"
cd /var/www/html/wsgi
python manage.py makemigrations
python manage.py migrate
chmod 777 db.sqlite3
python manage.py createsuperuser

echo "Installing PHP 5.6"
apt-get purge php5*
add-apt-repository ppa:ondrej/php
apt-get update
apt-get install php5.6 php5.6-common php5.6-curl php5.6-sqlite3

echo "Restarting apache."
service apache2 restart

echo "Install the Esri JSAPI to /var/www/html/esri/3.20/ and you are ready!"
