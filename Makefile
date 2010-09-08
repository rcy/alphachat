runserver:
	./$(node_dir)/node server.js

# 'make nodebuild' to fetch and compile node
node_url=http://nodejs.org/dist
node_dir=node-v0.1.104
node_tarball=$(node_dir).tar.gz

nodebuild: $(node_dir)
	cd $< && ./configure && make

$(node_dir): $(node_tarball)
	tar -xzf $(node_tarball)

$(node_tarball):
	wget $(node_url)/$(node_tarball)
