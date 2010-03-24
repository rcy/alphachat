start:
	./src/nginx-0.8.34/objs/nginx -p .

stop:
	./src/nginx-0.8.34/objs/nginx -p . -s stop

restart: stop start

# build nginx with push module
nginx_push_mod_url="http://pushmodule.slact.net/downloads/nginx_http_push_module-0.692.tar.gz"
nginx_url="http://nginx.org/download/nginx-0.8.34.tar.gz"

bootstrap: 
	rm -rf ./src
	mkdir -p ./src
	cd ./src && wget ${nginx_url}
	cd ./src && wget ${nginx_push_mod_url}
	cd ./src && tar -xzf nginx-0.8.34.tar.gz
	cd ./src && tar -xzf nginx_http_push_module-0.692.tar.gz
	cd ./src/nginx-0.8.34 && ./configure --add-module=../nginx_http_push_module-0.692 && make
