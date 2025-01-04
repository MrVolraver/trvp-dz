export default function Header() {
	return (
        <header className="header-block">
            <div className="header-block-left-part">
				<h1>Троллейбусный парк</h1>
			</div>
			<div className="header-block-right-part">
				<img src="/images/Avatar.jpg" className="header-block-right-part-avatar" alt="header-block-right-part-avatar" />
				<span className="header-block-right-part-name">Администратор Александр Юрченко</span>
			</div>
        </header>
    );
}
